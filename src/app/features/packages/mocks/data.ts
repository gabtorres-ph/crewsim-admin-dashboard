import type { PackageRead } from '../model'

export const mockPackages = [
  {
    id: 5001,
    sku: 'CREW-1GB-7D',
    name: 'Crew 1 GB / 7 days',
    price: 9.99,
    points: 100,
    sparkid: 'spark_crew_1gb',
    reward: 'standard',
  },
  {
    id: 5002,
    sku: 'CREW-5GB-30D',
    name: 'Crew 5 GB / 30 days',
    price: 29.99,
    points: 350,
    sparkid: 'spark_crew_5gb',
    reward: 'plus',
  },
  {
    id: 5003,
    sku: 'CREW-UNL-1D',
    name: null,
    price: 14.5,
    points: null,
    sparkid: null,
    reward: null,
  },
] satisfies readonly PackageRead[]
