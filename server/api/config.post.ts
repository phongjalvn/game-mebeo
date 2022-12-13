import supabase from '~~/libs/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  delete body.id
  const { error } = await supabase.from('configs').update(body).eq('id', 1)
  if (error) {
    return {
      statusCode: 400,
      success: false,
      message: error.message,
    }
  } else {
    return {
      statusCode: 200,
      success: true,
      message: 'OK',
    }
  }
})
