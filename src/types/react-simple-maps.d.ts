declare module "react-simple-maps" {
  import * as React from "react"

  export interface ComposableMapProps {
    projection?: string
    projectionConfig?: Record<string, unknown>
    width?: number
    height?: number
    style?: React.CSSProperties
    className?: string
    children?: React.ReactNode
  }

  export function ComposableMap(
    props: ComposableMapProps
  ): React.ReactElement

  export interface GeographiesRenderProps {
    geographies: Geography[]
    outline: unknown
    borders: unknown
  }

  export interface GeographiesProps {
    geography: string | object
    parseGeographies?: (features: Geography[]) => Geography[]
    children: (props: GeographiesRenderProps) => React.ReactNode
    className?: string
  }

  export function Geographies(props: GeographiesProps): React.ReactElement

  export interface Geography {
    rsmKey: string
    id?: string | number
    type?: string
    properties?: Record<string, unknown>
    geometry?: object
  }

  export interface GeographyProps {
    geography: Geography
    fill?: string
    stroke?: string
    strokeWidth?: number
    style?: {
      default?: React.CSSProperties
      hover?: React.CSSProperties
      pressed?: React.CSSProperties
    }
    className?: string
    onClick?: (event: React.MouseEvent) => void
    onMouseEnter?: (event: React.MouseEvent) => void
    onMouseLeave?: (event: React.MouseEvent) => void
  }

  export function Geography(props: GeographyProps): React.ReactElement

  export interface MarkerProps {
    coordinates: [number, number]
    children?: React.ReactNode
    className?: string
    style?: React.CSSProperties
    onClick?: (event: React.MouseEvent) => void
    onMouseEnter?: (event: React.MouseEvent) => void
    onMouseLeave?: (event: React.MouseEvent) => void
  }

  export const Marker: React.ForwardRefExoticComponent<
    MarkerProps & React.RefAttributes<SVGGElement>
  >

  export interface LineProps {
    from?: [number, number]
    to?: [number, number]
    coordinates?: [number, number][]
    stroke?: string
    strokeWidth?: number
    strokeDasharray?: string
    strokeLinecap?: "round" | "square" | "butt"
    fill?: string
    className?: string
    style?: React.CSSProperties
  }

  export const Line: React.ForwardRefExoticComponent<
    LineProps & React.RefAttributes<SVGPathElement>
  >

  export interface ZoomableGroupProps {
    center?: [number, number]
    zoom?: number
    minZoom?: number
    maxZoom?: number
    translateExtent?: [[number, number], [number, number]]
    onMoveStart?: (event: unknown) => void
    onMove?: (event: unknown) => void
    onMoveEnd?: (event: unknown) => void
    children?: React.ReactNode
    className?: string
  }

  export function ZoomableGroup(
    props: ZoomableGroupProps
  ): React.ReactElement

  export interface SphereProps {
    fill?: string
    stroke?: string
    strokeWidth?: number
    className?: string
  }

  export function Sphere(props: SphereProps): React.ReactElement

  export interface GraticuleProps {
    fill?: string
    stroke?: string
    strokeWidth?: number
    step?: [number, number]
    className?: string
  }

  export function Graticule(props: GraticuleProps): React.ReactElement
}
