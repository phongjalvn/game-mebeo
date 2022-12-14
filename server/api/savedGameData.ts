import supabase from '~~/libs/supabase'

export default defineEventHandler(async () => {
  const { data: easyPlayersData, error: easyError } = await supabase
    .from('playersData')
    .select()
    .eq('mode', 'easy')
    .order('score', { ascending: false })
    .order('time', { ascending: true })
    .limit(10)

  const { data: hardPlayersData, error: hardError } = await supabase
    .from('playersData')
    .select()
    .eq('mode', 'hard')
    .order('score', { ascending: false })
    .order('time', { ascending: true })
    .limit(10)

  if (easyPlayersData && hardPlayersData) {
    return {
      statusCode: 200,
      success: true,
      easyPlayersData,
      hardPlayersData,
    }
  } else {
    return {
      statusCode: 400,
      success: false,
      message: easyError?.message || hardError?.message,
    }
  }
})
