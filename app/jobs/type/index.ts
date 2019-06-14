export interface Job<PARAM, RESULT> {
  name: string

  run(params: PARAM): Promise<RESULT>
}
