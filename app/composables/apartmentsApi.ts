import {useApartmentsClient} from "~/composables/apartmentsClient";

export interface Advertisement {
    sourceId: string
    link: string
    sourceType: SourceType
    square: number
    roomsCount: number
    floorNumber: number
    totalFloorsNumber: number
    totalPrice: number
    squareMeterPrice: number
    realSquareMeterPrice: number
    renovationRating: number
    ideality: number
    updatedAt: string
    crawledAt: string
    firstTimeCrawledAt: string
    shortDescription: string
    advantages: string[]
    problems: string[]
    metroStations: Array<MetroStation>
    images: Array<AdvertisementImage>
}

export interface MetroStation{
    name: string
    distanceInMinutes: string
    distanceType: number
    color: string
    id: number
}

export interface AdvertisementImage{
    url: string
}

export enum SourceType {
    Cian = 0,
    Avito = 1,
    All = 999,
}

export class Filter {
    minDate = null
    maxDate = null
    minPrice : number | null = null
    maxPrice : number | null = null
    minPerSquareMeterPrice = null
    maxPerSquareMeterPrice = null
    minRenovationRating : number | null = null
    maxRenovationRating : number | null = null
    minSquare = null
    maxSquare = null
    roomsCount = []
    excludeFirstFloor = false
    excludeLastFloor = false
    sortBy = 0
    sortOrder: number | null = 0
    metroIds: number[] = []
    distanceInMinutes: number | null = null
    source: SourceType | null = null
    searchString: string | null = null
}

export const useApartmentsApi = () => {
    const client = useApartmentsClient()

    const loadApartments = async (filter: Filter, page: number, perPage: number) : Promise<Advertisement[]> => {

        const result = await client<PaginationData<Advertisement>>('advertisements/list', {
            method: 'POST',
            body: {
                filter: {
                    ...filter,
                    minPrice: filter.minPrice ? filter.minPrice * 1000000 : null,
                    maxPrice: filter.maxPrice ? filter.maxPrice * 1000000 : null,
                    source: toNumber(filter.source),
                    distanceInMinutes: toNumber(filter.distanceInMinutes),
                    metroIds: toNumber(filter.metroIds),
                    sortOrder: toNumber(filter.sortOrder),
                    roomsCount: toNumber(filter.roomsCount),
                },
                pagination: {
                    page: page,
                    perPage: perPage,
                }
            }
        });

        return result.data;
    }

    const toNumber = (source: any) => {
        if (source === null || source === undefined)
            return null;

        if (Array.isArray(source))
            return source.map(s => parseFloat(s));

        return parseFloat(source);
    }

    return {
        loadApartments,
    }
}