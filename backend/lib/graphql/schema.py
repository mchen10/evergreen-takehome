import graphene
from graphene import Mutation, ObjectType, InputObjectType, String, Schema
from graphene_sqlalchemy import SQLAlchemyObjectType
from models.vendor_model import VendorModel

class Vendor(SQLAlchemyObjectType):
  class Meta:
    model = VendorModel

class VendorInput(InputObjectType):
  id = graphene.String()
  name = graphene.String()
  description = graphene.String()
  external_link = graphene.String()
  category = graphene.String()
  status = graphene.Int()
  risk = graphene.String()
  tier = graphene.String()

class ModifyVendor(Mutation):
  vendor = graphene.Field(lambda: Vendor)

  class Arguments:
    vendor_data = VendorInput(required=True)

  def mutate(self, info, vendor_data):
    query = Vendor.get_query(info)
    vendor = query.filter(VendorModel.id == vendor_data.id).first()

    if vendor_data.status:
      vendor.status = vendor_data.status
    if vendor_data.category:
      vendor.category = vendor_data.category
    
    db_session.add(vendor)
    db_session.commit()

    return ModifyVendor(vendor=vendor)
  
class Query(ObjectType):
  vendors = graphene.List(Vendor)
  vendor = graphene.List(lambda: Vendor, filter=VendorInput())

  def resolve_vendors(root, info):
    query = Vendor.get_query(info)
    return query.all()

  def resolve_vendor(root, info, filter):
    query = Vendor.get_query(info)

    if filter.status:
      query = query.filter(VendorModel.status == filter.status)
    if filter.risk:
      query = query.filter(VendorModel.risk == filter.risk)
    if filter.category:
      query = query.filter(VendorModel.category == filter.category)

    return query.all()

class Mutation(ObjectType):
  modifyVendor = ModifyVendor.Field()

schema = Schema(query=Query, mutation=Mutation)
