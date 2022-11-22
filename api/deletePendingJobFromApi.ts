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
    console.log(`Warning: Unable to send delete image request. API offline?`)
  } finally {
    return {
      success: true
    }
  }
}
