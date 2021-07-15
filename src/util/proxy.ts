export const formatProxy = (arr: string) => {
  let formattedProxy;
  const splitProxy = arr.split(':');

  if (splitProxy.length > 0) {
    formattedProxy = `http://${splitProxy[2]}:${splitProxy[3]}@${splitProxy[0]}:${splitProxy[1]}`;
  } else {
    formattedProxy = `http://${splitProxy[0]}:${splitProxy[1]}`;
  }
  return formattedProxy;
};
export const getRandomProxy = (arr: string[]) => {
  if (arr.length > 0) {
    return arr[Math.floor(Math.random() * arr.length)];
  } else {
    return null;
  }
};
