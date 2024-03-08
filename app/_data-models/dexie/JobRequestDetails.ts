class JobRequestDetails {
  // Indexed fields
  jobId: string = ''
  timestamp: number = Date.now()

  // TODO: Image request params?

  constructor(params: Partial<JobRequestDetails>) {
    Object.assign(this, params)
  }
}

export { JobRequestDetails }
