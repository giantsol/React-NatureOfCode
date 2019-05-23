export interface GameDataDTO {
    players: PlayerDTO[]
    places: PlaceDTO[]
    canvasWidth: number
    canvasHeight: number
}

export interface PlayerDTO {
    id: string
    name: string
    x: number
    y: number
    size: number
}

export interface PlayerInputDTO {
    left: boolean
    right: boolean
    up: boolean
    down: boolean
}

export interface PlaceDTO {
    x: number
    y: number
    size: number
    type: PlaceTypeDTO
}

export enum PlaceTypeDTO {
    LAKE,
    SNOWLAND,
    ICELAND,
    HIGHGRASSLAND
}

export interface ProjectSelectionDataDTO {
    isRoot: boolean
    previews: ProjectPreviewDTO[]
}

export interface ProjectPreviewDTO {
    num: number
    name: string
    isOpen: boolean
}

export enum RootMessageDTO {
    ROOT_REQUEST_ACCEPTED,
    ROOT_REQUEST_DENIED,
    UNROOTED
}
