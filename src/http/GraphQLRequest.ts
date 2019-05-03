import HttpApiRequest from './HttpApiRequest'

type GraphQLQueryType =
  'UsersQuery' |
  'FetchContactsFullQuery' |
  'FetchContactsFullWithAfterQuery' |
  'FetchContactsDeltaQuery' |
  'ThreadListQuery' |
  'ThreadQuery' |
  'SeqIdQuery' |
  'UnreadThreadListQuery' |
  'FetchStickersWithPreviewsQuery'

const queryTypes: { [type in GraphQLQueryType]: string } = {
  UsersQuery: '10153915107411729',
  FetchContactsFullQuery: '10154444360806729',
  FetchContactsFullWithAfterQuery: '10154444360816729',
  FetchContactsDeltaQuery: '10154444360801729',
  ThreadListQuery: '2000270246651497',
  ThreadQuery: '10153919752036729',
  SeqIdQuery: '10155268192741729',
  UnreadThreadListQuery: '10153919752026729',
  FetchStickersWithPreviewsQuery: '10152877994321729'
}

interface GraphQLOptions {
  name: GraphQLQueryType
  params: any
}

export default class GraphQLRequest extends HttpApiRequest {
  constructor (options: GraphQLOptions) {
    const params = {
      query_id: queryTypes[options.name],
      query_params: JSON.stringify(options.params)
    }
    super({
      url: 'https://graph.facebook.com/graphql',
      method: 'get',
      friendlyName: options.name,
      params
    })
  }
}
