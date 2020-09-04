
const escapeQuery = (query = '') => query.replace(/:/g, ': ').replace(/,/g, ', ').replace(/  /g, ' ')

const matchesQueries = ({ media, queries, options }) => {

  const regexMedia   = escapeQuery(media || '')
  
  const regexQueries = (queries||[]).map(q => new RegExp( escapeQuery(q) ));
  
  return regexQueries.some( regex => regex.test(regexMedia));
}

module.exports = matchesQueries