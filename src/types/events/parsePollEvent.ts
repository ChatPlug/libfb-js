import { getEventMetadata } from './parseDeltaEvent'
import { PollCreateEvent, PollUpdateVoteEvent } from './PollEvents'
import { Event, EventType } from '../Events'

export default function parsePollEvent (delta: any): { type: EventType, event: Event } {
  const { untypedData } = delta
  const type = untypedData.event_type

  const question = JSON.parse(untypedData.question_json)
  const event = {
    ...getEventMetadata(delta),
    title: question.text,
    options: question.options.map(option => ({
      id: option.id,
      title: option.text,
      voteCount: option.total_count,
      voters: option.voters,
      viewerHasVoted: option.viewer_has_voted === 'true'
    }))
  }

  if (type === 'question_creation') {
    return {
      type: 'pollCreateEvent',
      event: event as PollCreateEvent
    }
  }
  if (type === 'update_vote') {
    return {
      type: 'pollUpdateVoteEvent',
      event: event as PollUpdateVoteEvent
    }
  }
}
