import { StyleSheet } from 'aphrodite';
import color from './color';

const bp = 8;

function customStyleSheet(f) {
  return {
    ...StyleSheet.create(
      f({
        color,
        bp,
      }),
    ),
  };
}

export default customStyleSheet(({ color, bp }) => ({
  logo: {
    height: 40,
    width: 40,
    marginRight: 2 * bp,
  },
  tableHeader: {
    color: color.foggy,
  },
  vendorDescriptionContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '60vh',
  },
  vendorDescriptionHeader: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: "center",
    justifyContent: "space-between"
  },
  searchContainer: {
    height: '3vh', 
    width: '95vw', 
    marginTop: '3vh', 
    display: 'flex', 
    alignContent: 'flex-start'
  },
  filterHeaderContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '85vw',
    marginTop: '4vh'
  },
  container: {
    backgroundColor: color.background,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));