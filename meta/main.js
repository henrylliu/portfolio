import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
async function loadData() {
    const data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
  
    return data;
}

function processCommits(data) {
    return d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: 'https://github.com/portfolio/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        Object.defineProperty(ret, 'lines', {
          value: lines,
          writable: true,
          enumerable: true,
          configurable: true
          // What other options do we need to set?
          // Hint: look up configurable, writable, and enumerable
        });
  
        return ret;
    });
}

function renderCommitInfo(data, commits) {
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);
  
    // Add total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
  
    // Add the number of files
    const numFiles = d3.group(data, d => d.file).size;
    dl.append('dt').text('Number of files');
    dl.append('dd').text(numFiles);

    // Average amount of lines in a file
    const avgLinesPerFile = data.length / numFiles;
    dl.append('dt').text('Average number of lines');
    dl.append('dd').text(avgLinesPerFile);

    // Add time of day that most work is done
    const workByPeriod = d3.rollups(
        data,
        (v) => v.length,
        (d) => {
          const hour = new Date(d.datetime).getHours();
          if (hour >= 20 || hour < 4) return 'After 8 PM';
          else if (hour >= 16) return 'Evening (4–8 PM)';
          else if (hour >= 12) return 'Afternoon (12–4 PM)';
          else if (hour >= 8) return 'Morning (8 AM–12 PM)';
          else return 'Early morning (before 8 AM)';
        }
    );
    const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

    dl.append('dt').text('Most work done')
    dl.append('dd').text(maxPeriod)


    // Add day that the most work is done
    const workByDay = d3.rollups(
        data,
        (v) => v.length,
        (d) => new Date(d.datetime).toLocaleString('en', { weekday: 'long' })
    );
    const maxDay = d3.greatest(workByDay, (d) => d[1])?.[0];
    
    dl.append('dt').text('Busiest day of the week');
    dl.append('dd').text(maxDay);

}

let data = await loadData();
let commits = processCommits(data);
renderCommitInfo(data, commits);