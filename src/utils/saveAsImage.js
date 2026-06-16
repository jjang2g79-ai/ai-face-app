import html2canvas from 'html2canvas'

export async function saveAsImage(elementRef) {
  const canvas = await html2canvas(elementRef, {
    useCORS: true,
    backgroundColor: '#1e293b',
    scale: 2,
  })

  const link = document.createElement('a')
  link.download = 'ai-face-result.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}
