# Lessons Learned 

Next JS is a lightwieght JavaScript framework based on React that handles a lot of the common features implemented in React. 

## Data Fetching 
- [Data Fetching](https://nextjs.org/docs/basic-features/data-fetching) (API calls) made with Next JS need to be made with: 
  1. `getStaticProps` (Static Generation) => Fetch data at build time.
  2. `getStaticPaths` (Static Generation): Specify dynamic routes to pre-render based on data.
  3. `getServerSideProps` (Server-side Rendering): Fetch data on each request.
- The primary method of data fetching 

