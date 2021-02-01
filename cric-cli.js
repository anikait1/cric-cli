const fetch = require("node-fetch");
const yargs = require("yargs");
require("dotenv").config();

const URL = process.env.URL;
const API_KEY = process.env.API_KEY;

const routes = {
  MATCHES: "matches",
  SCORE: "cricketScore",
  SCORECARD: "fantasySummary"
};

const filterMatches = (match) => {
  const today = new Date();
  const matchDate = new Date(match["date"]);

  if (today.setHours(0, 0, 0, 0) === matchDate.setHours(0, 0, 0, 0)) {
    return true;
  } else {
    return false;
  }
};

const mapMatches = (match) => ({
  id: match.unique_id,
  date: match.date.split("T")[0],
  team_one: match["team-1"],
  team_two: match["team-2"],
  type: match.type,
  match_started: match.matchStarted,
});

const getMatches = async () => {
  const matchesUrl = `${URL}/${routes.MATCHES}?apikey=${API_KEY}`;
  const response = await fetch(matchesUrl);
  const data = await response.json();

  const matches = data["matches"];
  const filteredMatches = matches.filter(filterMatches).map(mapMatches);

  console.table(filteredMatches);
};

const getScore = async (matchID) => {
  const scoreUrl = `${URL}/${routes.SCORE}?apikey=${API_KEY}&unique_id=${matchID}`;
  const response = await fetch(scoreUrl);
  const data = await response.json();
  
  const score = data["score"];
  console.log(`Summary: ${score}`);
};

yargs
  .scriptName("cric-cli")
  .usage("$0 <cmd> [args]")
  .command(
    "matches [format]",
    "List all the current matches based on the format",
    (yargs) => {
      yargs.positional("format", {
        type: "string",
        default: "ALL",
        describe: "filter matches",
      });
    },
    (argv) => getMatches(argv.format)
  )
  .command(
    "score [id]",
    "List score for the match corresponding to the given id",
    (yargs) => {
      yargs.positional("id", {
        id: "number",
        default: -1,
        describe: "unique id for a match",
      });
    },
    (argv) => getScore(argv.id)
  )
  .help().argv;
