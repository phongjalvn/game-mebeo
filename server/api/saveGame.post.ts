import { decode } from 'base64-arraybuffer'
import supabase from '~~/libs/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const imagesData = body.imagesData.map(async (imageData: any) => {
    const now = Date.now()
    const dataBuffer = decode(
      imageData.imgData.replace(/^data:image\/\w+;base64,/, '')
    )
    const { data, error } = await supabase.storage
      .from('game')
      .upload(`public/image-${imageData.class}-${now}.png`, dataBuffer, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      return {
        success: false,
        message: error.message,
      }
    }

    const { data: publicData } = supabase.storage
      .from('game')
      .getPublicUrl(data.path)

    return {
      ...imageData,
      imgData: publicData.publicUrl,
    }
  })

  const { error } = await supabase.from('playersData').insert({
    ...body,
    imagesData: await Promise.all(imagesData),
  })

  if (!error) {
    return {
      success: true,
      message: 'Saved game data',
    }
  }

  return {
    success: false,
    message: error.message,
  }
})
