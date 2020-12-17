
export const capitalize = function(value) {
  return value.trim().toLowerCase().replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
}

export const uploadImage = async function uploadImage({file, target}) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", file.type);
  const requestOptions = {
    method: 'PUT',
    headers: myHeaders,
    body: file,
    redirect: 'follow'
  };
  try {
    const resp = await fetch(target, requestOptions)
    return resp.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}