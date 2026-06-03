export interface ObjectBrowserLocation {
  readonly connectionId?: string
  readonly bucket?: string
  readonly prefix?: string
  readonly objectKey?: string
}

export interface ObjectTableRow {
  readonly name: string
  readonly type: 'prefix' | 'object'
  readonly size?: number
  readonly lastModified?: string
  readonly format?: string
}
