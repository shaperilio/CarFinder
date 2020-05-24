# CarFinder

Some car dealerships have a common back end the pull inventory from, but you cannot search them all from e.g. the manufacturer's website. (Subaru is an example.)

This simple script will allow you to add dealerships, get results for a specific model and trim, and generate a simple HTML page with the results sorted by "final price" in ascending order. It will also create an archive JSON file with the sorted results.

Note that, quite often, the "final price" is just the MSRP if the delerships choose not to expose their discounts to the public.

## Usage 

Create the archive and cache subfolders:

```
mkdir archive
mkdir cache
```

You can make yourself a shell script containing this and then add it to a cron job if you'd like.

```
node main.js > lastrun.log 2>&1
```

Fetching is done via a cache which expires on the hour. Be sure to clear the `cache` folder every so often.

### Subaru

If you don't want to look for Outback Onyx editions, simply perform the search at any dealership, look at the URL query string, and put that into `fetchCars` in [subaru.js](subaru.js).

### Jeep

It's... more complicated. Currently attempting to extract matching inventory from the manufacturer website (which makes for very exact results), and then traversing through dealership search results to match cars by VIN so we can get the real price.

