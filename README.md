# Lion Bracket Engine
A library that includes data structures for storing and updating tournament brackets. 
The following brackets are currently supported:

- [Swiss Bracket](https://en.wikipedia.org/wiki/Swiss-system_tournament)
- [AFL Bracket](https://en.wikipedia.org/wiki/AFL_final_eight_system)

This library supports the webapp [LionBracket](https://github.com/peteryn/LionBracket).

# Roadmap
Future supported formats:

- Single Elimination
- Double Elimination
- GSL

In the future, brackets can be composed into tournaments. For example, some tournaments use a 16 team swiss bracket to
find the top 8. The top 8 then play a single elimination bracket to determine the tournament winner.

# Architecture
A `Bracket` object should contain the "root" nodes (1 or multiple). These "root" nodes are the first matches played
in the bracket. "Child" nodes of any node represent future matches. Storing brackets this way simplifies how future
rounds are updated.

# Testing
Each supported bracket features its own testing suite with unit and funcitonal tests.

# Commands
Run Tests
```
deno test --allow-read
```
Get data from liquipedia
```
deno run getTournament LIQUIPEDIA_LINK
```
