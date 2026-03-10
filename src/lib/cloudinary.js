const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export async function uploadToCloudinary(file, onProgress) {
  const resourceType = file.type.startsWith('video/') ? 'video' : 'image'
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', 'vip-fitness')

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText)
        // For videos: build a proper Cloudinary thumbnail URL using the public_id
        // so_0 = snapshot at 0s, f_jpg = JPEG format, q_80 = quality, w_800 = width
        const thumbnailUrl = resourceType === 'video'
          ? `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_0,f_jpg,q_80,w_800/${data.public_id}.jpg`
          : data.secure_url
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          resourceType: data.resource_type,
          width: data.width,
          height: data.height,
          duration: data.duration || null,
          thumbnailUrl,
        })
      } else {
        reject(new Error(`Cloudinary upload failed: ${xhr.statusText}`))
      }
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(formData)
  })
}

export async function deleteFromCloudinary(publicId) {
  console.warn('Cloudinary delete must be done server-side. publicId:', publicId)
}
