import { HordeWorkerDetails } from '_types/horde'
import { sortWorkers } from './sortWorkers'

const worker = (overrides: Partial<HordeWorkerDetails>) =>
  ({
    id: 'id',
    name: 'name',
    models: [],
    uptime: 3600,
    kudos_rewards: 0,
    trusted: false,
    ...overrides
  }) as HordeWorkerDetails

const workers = [
  worker({ id: 'b', name: 'Bravo', models: ['x'], kudos_rewards: 300 }),
  worker({ id: 'c', name: 'Charlie', models: ['x', 'y', 'z'], uptime: 0 }),
  worker({ id: 'a', name: 'Alpha', models: ['x', 'y'], kudos_rewards: 900 })
]

const ids = (list: HordeWorkerDetails[]) => list.map(({ id }) => id)

describe('sortWorkers', () => {
  it.each([
    ['name', 'asc', ['a', 'b', 'c']],
    ['name', 'dsc', ['c', 'b', 'a']],
    ['models', 'asc', ['b', 'a', 'c']],
    ['kph', 'dsc', ['a', 'b', 'c']]
  ] as const)('sorts by %s %s', (sortBy, sortOrder, expected) => {
    expect(ids(sortWorkers(workers, sortBy, sortOrder))).toEqual(expected)
  })

  it('treats a worker with no uptime as earning nothing per hour', () => {
    expect(ids(sortWorkers(workers, 'kph', 'asc'))[0]).toBe('c')
  })

  it('leaves the list it was given in its original order', () => {
    const list = [...workers]

    sortWorkers(list, 'name', 'asc')

    expect(ids(list)).toEqual(['b', 'c', 'a'])
  })
})
