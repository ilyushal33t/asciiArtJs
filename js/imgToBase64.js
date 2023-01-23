const toDataURL = url => fetch(url)
  .then(async response => {
    response = await response.blob()
    console.log (URL.createObjectURL(response) )
    return response
  })
  .then(blob => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
}))