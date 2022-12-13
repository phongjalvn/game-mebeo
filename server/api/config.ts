import supabase from '~~/libs/supabase'

export default defineEventHandler(async () => {
  const { data, error } = await supabase.from('configs').select().limit(1)
  if (data) {
    return {
      success: true,
      message: 'Fetched config data',
      data: data[0],
    }
  } else {
    return {
      success: false,
      message: error.message,
    }
  }
})
