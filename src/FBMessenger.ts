import FacebookApi from './FacebookApi'

const login = async (email: string, password: string) => {
  const api = new FacebookApi
  await api.doLogin(email, password)
};

export default login;