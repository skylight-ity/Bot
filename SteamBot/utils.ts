import { exists, readFile, writeFile } from 'fs'

export const waitAsync = (seconds: number) =>
  new Promise(resolve => {
    setTimeout(resolve, seconds * 1000)
  })

export const errMessage = (err: any): string => {
  if (err instanceof Error) {
    return err.message
  } else if (typeof err === 'string') {
    return err
  } else {
    return JSON.stringify(err)
  }
}
export const existsAsync = (path: string | Buffer) =>
  new Promise<boolean>((resolve, reject) => {
    exists(path, ex => {
      resolve(ex)
    })
  })

export const readFileAsync = (filename: string) =>
  new Promise<Buffer>((resolve, reject) => {
    readFile(filename, (err, data) => {
      if (err) {
        return reject(err)
      }

      resolve(data)
    })
  })

export const writeFileAsync = (filename: string, data: any) =>
  new Promise((resolve, reject) => {
    writeFile(filename, data, err => {
      if (err) {
        return reject(err)
      }

      resolve()
    })
  })
