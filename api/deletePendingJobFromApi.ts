export const deletePendingJobFromApi = async (jobId: string) => {
  if (!jobId) {
    return {
      success: false
    }
  }

  try {
    await fetch(`https://stablehorde.net/api/v2/generate/status/${jobId}`, {
      method: 'DELETE'
    })
  } finally {
    return {
      success: true
    }
  }
}
