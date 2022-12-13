import supabase from '~~/libs/supabase'

export default defineEventHandler(async () => {
  const { data, error } = await supabase.from('configs').select().limit(1)
  if (data) {
    return {
      statusCode: 200,
      success: true,
      message: 'Fetched config data',
      data: data[0],
    }
  } else {
    return {
      statusCode: 400,
      success: false,
      message: error.message,
    }
  }
})
