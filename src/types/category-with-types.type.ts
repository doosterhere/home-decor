export type CategoryWithTypesType = {
  id: string,
  name: string,
  url: string,
  types: {
    id: string,
    name: string,
    url: string
  }[],
  typesUrl?: string[]
}
