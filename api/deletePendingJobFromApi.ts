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
  } catch (err) {
    // Ah well.
  }

  return {
    success: true
  }
}
