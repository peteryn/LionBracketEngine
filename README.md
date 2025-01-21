# Lion Bracket Engine
Lion Bracket Engine is a versatile library for managing and predicting tournament brackets. It supports both qualification and elimination formats, including Swiss and AFL. The library provides a intuitive API for creating brackets, updating match results, and calculating future matches.

This library supports the webapp [LionBracket](https://github.com/peteryn/LionBracket).

# Features
- Supports [Swiss Bracket](https://en.wikipedia.org/wiki/Swiss-system_tournament) with game differential and 
[Buchholz](https://en.wikipedia.org/wiki/Buchholz_system) tie breakers
- Supports [AFL Bracket](https://en.wikipedia.org/wiki/AFL_final_eight_system)
- Includes an simple way to update match results by match id
- Each supported bracket features its own testing suite with unit and functional tests

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

# Commands
Run Tests
```
deno test --allow-read
```
Get data from liquipedia
```
deno run getTournament LIQUIPEDIA_LINK
```
