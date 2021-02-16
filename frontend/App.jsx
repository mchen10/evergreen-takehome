import React, { useState } from 'react';
import { css } from 'aphrodite';
import { gql, useMutation, useQuery } from '@apollo/client';

import styles from './lib/styles';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from "@material-ui/icons/Clear";

import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from "@material-ui/core/IconButton";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';

import Select from 'react-select'

import { CSVLink } from "react-csv";

// Apollo query to retrieve vendors; certain attributes can be filtered on
const FILTER_VENDOR_QUERY = gql`
  query GetVendor($category: String, $status: Int, $risk: String) {
    vendor(filter: {category: $category, status: $status, risk: $risk}) {
      id,
      name,
      description,
      externalLink,
      category,
      status,
      risk,
      tier
    }
  }
`;

// Apollo query to update vendor info; an ID is required to do so
const MUTATE_VENDORS = gql`
  mutation MutateVendors($id: String!, $status: Int, $category: String) {
    modifyVendor(vendorData: { id: $id, status: $status, category: $category } ) {
      vendor {
        id
      }
    }
  }
`;

// All the different options for react-select 

const statusOptions = [
  { value: '1', label: 'Active' },
  { value: '2', label: 'Preferred' }
]

const categoryOptions = [
  { value: '1', label: 'Software' },
  { value: '2', label: 'Consulting' },
  { value: '3', label: 'Other' }
]

const riskOptions = [
  { value: '1', label: 'High' },
  { value: '2', label: 'Medium' },
  { value: '3', label: 'Low' }
]

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'risk', label: 'Risk' },
  { value: 'status', label: 'Status' }
]

// Helper function to retrive the react-select value/label pair given the value from the given options
function getDefaultOption(value, options) {
  for (var i = 0; i < options.length; i++) {
    if (value == options[i].value) {
      return options[i];
    }
  }

  return null;
}

// Helper function to sort the vendors on a provided key
function sortVendors(key) {
  return function innerSort(a, b) {
    var aValue, bValue;

    // For risk, cannot just sort on the label, since the risk labels will be sorted strangely (High, Low, Medium).
    // Must retrieve the keys associated with each label, and sort on the keys.
    if (key == "risk") {
      for (var pair of riskOptions) {
        if (a[key] == pair.label) {
          aValue = pair.value;
        }
        if (b[key] == pair.label) {
          bValue = pair.value;
        }
      }
    } else {
      aValue = a[key];
      bValue = b[key];
    }

    if (aValue > bValue) return 1;
    if (bValue > aValue) return -1;
    
    return 0;
  };
}

// Component to display the vendor name search bar 
function SearchContainer(props) {
  return (
    <div className={css(styles.searchContainer)}>
        <TextField value={props.searchNameStr} variant="outlined" size="small" fullWidth placeholder="Search by name"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <IconButton onClick={() => props.setSearchName("")}>
                <ClearIcon />
              </IconButton>
            )
          }}
          onChange={(event) => {event ? props.setSearchName(event.target.value) : props.setSearchName("")}}
        />
      </div>
  );
}

// Component to display the filter options
function FilterContainer(props) {
  return (
    <div className={css(styles.filterHeaderContainer)}>
        <div style={{ width: '15vw', marginRight: '1vw', display: 'flex', flexDirection: 'column' }}>
          <p>Status</p>
          <Select options={statusOptions} isClearable={true} isSearchable={false} defaultValue={getDefaultOption(props.status, statusOptions)} onChange={(event) => {
            event ? props.setStatus(parseInt(event.value)) : props.setStatus(-1)           
          }}/>
        </div>
        <div style={{ width: '15vw', marginRight: '1vw', display: 'flex', flexDirection: 'column' }}>
          <p>Category</p>
          <Select options={categoryOptions} isClearable={true} isSearchable={false} defaultValue={getDefaultOption(props.category, categoryOptions)} onChange={(event) => {
            event ? props.setCategory(event.label) : props.setCategory("")    
          }}/>
        </div>
        <div style={{ width: '15vw', marginRight: '1vw', display: 'flex', flexDirection: 'column'}}>
          <p>Risk</p>
          <Select options={riskOptions} isClearable={true} isSearchable={false} defaultValue={getDefaultOption(props.risk, riskOptions)} onChange={(event) => {
            event ? props.setRisk(event.label) : props.setRisk("")    
          }}/>
        </div>
        <div style={{ width: '15vw', display: 'flex', flexDirection: 'column' }}>
          <p>Sort by</p>
          <Select options={sortOptions} isClearable={true} isSearchable={false} defaultValue={getDefaultOption(props.sort, sortOptions)} onChange={(event) => {
            event ? props.setSort(event.value) : props.setSort("")    
          }}/>
        </div>
      </div>
  );
}

// Component to display the vendor name, description, and name
function VendorDescriptionContainer(props) {
  return (
    <div className={css(styles.vendorDescriptionContainer)}>
      <div className={css(styles.vendorDescriptionHeader)}>
        <h1 align="left">{props.name}</h1>
        <a href={props.link} display='flex' flexDirection='row'>
          <p>{props.link}</p>
        </a>
      </div>
      <p>{props.description}</p>
    </div>
  );
}

// Component to display all the vendor information within a table
function VendorTable(props) {
  // Retrive the Apollo mutate function
  const [mutateVendor, { data }] = useMutation(MUTATE_VENDORS)

  return (
    <div style={{ width: '95vw', marginTop: '1vh' }}>
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell className={css(styles.tableHeader)}>VENDOR</TableCell>
              <TableCell align="right" className={css(styles.tableHeader)}>CATEGORY</TableCell>
              <TableCell align="right" className={css(styles.tableHeader)}>STATUS</TableCell>
              <TableCell align="right" className={css(styles.tableHeader)}>TIER</TableCell>
              <TableCell align="right" className={css(styles.tableHeader)}>RISK</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.vendors.map((vendor) => (
              <TableRow key={vendor.name}>
                <TableCell>
                  <VendorDescriptionContainer name={vendor.name} description={vendor.description} link={vendor.externalLink}/>
                </TableCell>
                <TableCell align="right">
                  <Select options={categoryOptions} defaultValue={getDefaultOption(vendor.category, categoryOptions)} onChange={(event) => {
                    mutateVendor({ variables: { id: vendor.id, category: event.value } });
                  }}/>
                </TableCell>
                <TableCell align="right">
                  <Select options={statusOptions} defaultValue={getDefaultOption(vendor.status, statusOptions)} onChange={(event) => {
                    mutateVendor({ variables: { id: vendor.id, status: parseInt(event.value) } });
                  }}/>
                </TableCell>
                <TableCell align="right">{vendor.tier}</TableCell>
                <TableCell align="right">{vendor.risk}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

function App() {
  // The state hooks for filtering
  const [status, setStatus] = useState(-1);
  const [category, setCategory] = useState("");
  const [risk, setRisk] = useState("");

  // The state hook for the sort key
  const [sort, setSort] = useState("");

  // The state hook for the name search string
  const [searchNameStr, setSearchName] = useState("");

  // Create the dictionary to allow Apollo to filter on
  var filterVars = {};
  if (status != -1) 
    filterVars["status"] = status
  if (category != "") 
    filterVars["category"] = category
  if (risk != "") 
    filterVars["risk"] = risk

  const { loading, error, data } = useQuery(FILTER_VENDOR_QUERY, {
    variables: filterVars,
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  var processedVendors = data.vendor.slice() // Needed because in strict mode

  if (searchNameStr != "") {
    // Search by going through all vendor names, and if a name contains the target string, adding to the displayed vendors 
    var searchVendors = []
    for (var i = 0; i < processedVendors.length; i++) {
      if (processedVendors[i].name.toLowerCase().includes(searchNameStr.toLowerCase())) {
        searchVendors.push(processedVendors[i]);
      }
    }
    processedVendors = searchVendors.slice();
  }

  if (sort != "")
    // Sort the vendors based on the custom comparator
    processedVendors = processedVendors.slice().sort(sortVendors(sort))

  return (
    <div className={css(styles.container)}>
      <SearchContainer setSearchName={setSearchName} searchNameStr={searchNameStr}/>
      <div style={{ width: '95vw', display: 'flex', flexDirection: 'row' }}>
        <FilterContainer status={status} category={category} risk={risk} sort={sort} setStatus={setStatus} setCategory={setCategory} setRisk={setRisk} setSort={setSort}/>  
        <div style={{ width: '10vw', display: 'flex', alignItems:'center', justifyContent: 'center' }}>
          <Button variant="outlined">
            <CSVLink style={{textDecoration: 'none', color: 'black'}} data={processedVendors}>Export</CSVLink>
          </Button>
        </div>
      </div>
      <VendorTable vendors={processedVendors} />
    </div>
  );
}

export default App;
