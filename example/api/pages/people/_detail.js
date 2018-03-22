module.exports = ({ params }) =>
  Promise.resolve({
    slug: params.detail
  })
