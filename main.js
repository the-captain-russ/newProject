    let playersPlaying;
    let roundsOfCards;
    let currentRound = 1;
    let cardsDealt = 1;
    let scoreCardColSpan;
    let canScoreRound = false;
    let playerDealing;
    let gamePlayed = "";
    let winningPlayer;
    //let document;
    const playerNames = document.getElementById("player-names");
    const playerForm = document.getElementById("list-of-players");
    const howManyPlayers = document.getElementById("how-many-players");
    const scoreTable = document.getElementById("score-table");
    const topRow = document.getElementById("score-card-top-row");
    const infoRow = document.getElementById("score-card-info-row");
    const totalRow = document.getElementById("total-row");
    const scoreTableBody = document.getElementById("score-table-body");
    const scoreCardPlayerRow = document.getElementById("score-card-player-row");
    const infoCardPlayerRow = document.getElementById("game-info-row");
    const dealerRow = document.getElementById("score-card-dealer-row");
    const gameOver = document.getElementById("game-over");
    const whoIsDealing = document.getElementById("who-is-dealing");
    const numberToWordObject = {
        "1": "One",
        "2": "Two",
        "3": "Three",
        "4": "Four",
        "5": "Five",
        "6": "Six",
        "7": "Seven",
        "8": "Eight",
        "9": "Nine",
        "10": "Ten",
        "11": "Eleven",
        "12": "Twelve",
        "13": "Thirteen",
        "14": "Fourteen",
        "15": "Fifteen",
        "16": "Sixteen",
        "17": "Seventeen",
        "18": "Eighteen",
        "19": "Nineteen",
        "20": "Twenty"
    };


    function countPlayers(gamePlaying) {
        let i;
        gamePlayed = gamePlaying;

        playersPlaying = document.getElementById("players-playing").value;
        document.getElementById("num-of-players").innerHTML=`There are ${playersPlaying} players playing`;
        howManyPlayers.hidden = true;
        for (i = 0; i < playersPlaying; i += 1) {
            playerForm.innerHTML += `<li><label for=\"player-${i}\">Player Name:</label><input type=\"text\" id=\"player-${i}\" name=\"player-${i}\" required></li>`;
        }

        if (gamePlayed === "Wizard") {
            roundsOfCards = 60/playersPlaying;
        } else if (gamePlayed === "Up and Down") {
            roundsOfCards = 13;
        }

        scoreCardPlayerRow.colSpan = playersPlaying * 2 + 1;
        infoCardPlayerRow.colSpan = playersPlaying * 2 + 1;

        playerNames.hidden = false;
    }

    let playerArray = [];

    const playerFactory = (name, number) => {
        return {
            _name: name,
            _number: number,
            _score: {},
            _totalScore: 0,
            _tricksBid: {},
            _tricksTaken: {},
            _bidLocked: false,
            _isDealer: false,
            get name() {
                return this._name;
            },
            get number() {
                return this._number;
            },
            get score() {
                return this._score;
            },
            set score(newScore) {
                this._score = newScore;
                this._totalScore += newScore;
            },
            get totalScore() {
                return this._totalScore;
            },
            set totalScore(newScore) {
                this._totalScore = newScore;
            },
            get tricksBid() {
                return this._tricksBid;
            },
            set tricksBid(newTricksBid) {
                this._tricksBid = newTricksBid;
            },
            get tricksTaken() {
                return this._tricksTaken;
            },
            set tricksTaken(newTricksTaken) {
                this._tricksTaken = newTricksTaken;
            },
            get bidLocked() {
                return this._bidLocked;
            },
            set bidLocked(newBidLocked) {
                this._bidLocked = newBidLocked
            },
            get isDealer() {
                return this._isDealer;
            },
            set isDealer(newIsDealer) {
                this._isDealer = newIsDealer;
            },
            getTotal() {
                this.totalScore += this.score[currentRound];
                return this.totalScore;
            }
        };
    };

    function buildPlayers() {
        let i;

        for (i = 0; i < playersPlaying; i += 1) {

            let nameFromInput = document.getElementById(`player-${i}`).value;
            playerArray.push(playerFactory(nameFromInput, i));
            topRow.innerHTML += `<th colspan=\"2\" id=\"player${i}-name-box\">${nameFromInput}</th>`;
            dealerRow.innerHTML += `<td id=\"player${i}-dealing-box\" colspan=\"2\"></td>`;
            infoRow.innerHTML += "<th>Bid</th><th>Score</th>";
            totalRow.innerHTML += `<td colspan=\"2\" id=\"player-${i}-total\">0</td>`;
        }

            whoIsDealing.hidden = false;
            playerNames.hidden = true;

        for (i = 0; i < playersPlaying; i += 1) {
            whoIsDealing.innerHTML += `
                    <input type=\"radio\" id=\"player${i}-dealing\" name=\"dealer\" value=\"player${i}-is-dealing\" required>
                    <label for=\"player${i}-dealing\">${playerArray[i].name}</label>
                    <br>
            `;
        }

        //rebuild player form with player names and a radio button asking for first dealer
        //Player 1: O
        //Player 2: O
        //Player 3: O
        //
        // (Who is Dealing First?)
        whoIsDealing.innerHTML += "<input type=\"submit\" id=\"dealing-first-button\" value=\"Who is Dealing First?\">";
        winningPlayer = playerFactory('Nobody', -1);
    }

    function setDealer() {
        let i;

        for (i = 0; i < playersPlaying; i += 1) {
            let playerRadioButton = document.getElementById(`player${i}-dealing`);
            let playerDealerBox = document.getElementById(`player${i}-dealing-box`);
            if (playerRadioButton.checked) {
                    playerArray[i].isDealer = true;
                    playerDealerBox.innerHTML = "Dealer";
                    playerDealing = playerArray[i];
                } else {
                    playerDealerBox.innerHTML = "";
            }   
        }      

        whoIsDealing.hidden = true;
        scoreTable.hidden = false;
        buildRow(currentRound);
    }                           

    function setNextDealer() {
        let currentNumber = playerDealing.number;
        let nextNumber;
        if (currentNumber === playersPlaying - 1) {
            nextNumber = 0;
        } else {
            nextNumber = currentNumber + 1;
        }

        playerArray[currentNumber].isDealer = false;
        document.getElementById(`player${currentNumber}-dealing-box`).innerHTML = "";
        //document.getElementById(`player${currentNumber}-dealing-box`).style.backgroundColor = "white"
        
        document.getElementById(`player${nextNumber}-dealing-box`).innerHTML="Dealer";
        //document.getElementById(`player${nextNumber}-dealing-box`).style.backgroundColor = "green"
        playerArray[nextNumber].isDealer = true;
        playerDealing = playerArray[nextNumber];
    }

    const whoHasHighestScore = () => {
        let highestScore = 0;
        let scoreArray = [];
        for (i = playersPlaying - 1; i >= 0; i -= 1) {
            scoreArray.push(playerArray[i].totalScore);
        }

        for (i = 0; i < playersPlaying; i += 1) {
            const currentScore = playerArray[i].totalScore;
            scoreArray.filter(totals => totals = currentScore);
            if (playerArray[i].totalScore > highestScore) {
                winningPlayer = playerArray[i];
            }
        }
    }

    function lockBid(playerNum, roundNum) {
        let bidBoxToLock = document.getElementById(`player${playerNum}-round${roundNum}-bidbox`);
        let bidToLock = document.getElementById(`player${playerNum}-round${roundNum}-bid`).value;
        let i;

        bidBoxToLock.innerHTML = `
        Tricks Bid: ${bidToLock}
        <br>
        <input type=\"number\" id=\"tricks-taken-player${playerNum}-round${roundNum}\" name=\"tricks-taken-player${playerNum}-round${roundNum}\" required max=\"${roundNum}\">
        `;

        playerArray[playerNum].bidLocked = true;

        canScoreRound = true;
        
        for (i=0; i < playersPlaying; i += 1) {
            if (!playerArray[i].bidLocked) {
                canScoreRound = false;
            }
        }

        if(canScoreRound) {
            document.getElementById(`round-${roundNum}-score`).hidden = false;
        }
        
        playerArray[playerNum].tricksBid[roundNum] = bidToLock;
    }

    function buildRow() {
        let i;

        scoreTableBody.innerHTML += `
        <tr id=\"score-row-${currentRound}\">
            <td id = \"row-title-${currentRound}\" class=\"row-title\">${numberToWordObject[currentRound]}
            <br>
            <input id=\"round-${currentRound}-score\" type=\"button\" onclick=\"scoreRound()\" value=\"Score Round\" hidden>
            <h6 id=\"row-${currentRound}-error\" hidden>Invalid Number of Tricks Input, Please Try Again</h6>
            </td>
        `;
        let tableRow = document.getElementById(`score-row-${currentRound}`);

        for(i = 0; i < playersPlaying; i += 1) {
            tableRow.innerHTML += `
                    <td id=\"player${i}-round${currentRound}-bidbox\">
                        <form action=\"#\" onsubmit=\"lockBid(${i}, ${currentRound}); return false\">
                            <input type=\"number\" name=\"player${i}-round${currentRound}-bid\" id=\"player${i}-round${currentRound}-bid\" max=\"${cardsDealt}\" required>
                            <input id=\"player${i}-round${currentRound}-submit-button\" type=\"submit\" value=\"Lock Bid\">
                        </form>
                    </td>
                    <td id=\"player${i}-round${currentRound}-scorebox\">
                    </td>
            `;
            playerBox = document.getElementById(`player${i}-name-box`);
        }
        infoCardPlayerRow.innerHTML = `
            Cards Dealt: ${cardsDealt} 
            Current Dealer: ${playerDealing.name}
            Highest Score: ${winningPlayer.name}, Score: ${winningPlayer.totalScore};
        `
    }

    function scoreRound() {
        let i;
        let rowErrorMessage = document.getElementById(`row-${currentRound}-error`);
        let totalBidsTaken = 0;

        for (i = 0; i < playersPlaying; i ++){
            let tricksTakenThisRoundElement = document.getElementById(`tricks-taken-player${i}-round${currentRound}`);
            let tricksTakenThisRound = parseInt(tricksTakenThisRoundElement.value);
            totalBidsTaken += tricksTakenThisRound;
        }

        if (totalBidsTaken != cardsDealt) {
            rowErrorMessage.hidden = false;
        } else {
            for (i = 0; i < playersPlaying; i += 1) {
                let bidBox = document.getElementById(`player${i}-round${currentRound}-bidbox`);
                const currentPlayer = playerArray[i];
                tricksTaken = document.getElementById(`tricks-taken-player${i}-round${currentRound}`);
                playerArray[i].tricksTaken[currentRound] = tricksTaken.value;
                bidBox = document.getElementById(`player${i}-round${currentRound}-bidbox`);
                takenTricks = currentPlayer.tricksTaken[currentRound];
                bidTricks = currentPlayer.tricksBid[currentRound];
                let score = 0;
                if (gamePlayed === "Wizard") {
                    if (takenTricks != bidTricks) {
                        score = Math.abs(
                            takenTricks - bidTricks
                        ) * 10 * -1;
                    } else {
                        score = takenTricks * 10 + 20;
                    }
                } else if (gamePlayed === "Up and Down") {
                    if (takenTricks != bidTricks) {
                        score = Math.abs(takenTricks - bidTricks) * 3 * -1 ;
                    } else {
                        score = takenTricks * 3 + 10;
                    }
                }

                bidBox.innerHTML = `
                <tr>
                    Tricks Bid: ${bidTricks}
                </tr>
                <br>
                <tr>
                    Tricks Taken: ${tricksTaken}
                </tr>`;
    
                currentPlayer.score[currentRound] = score;
                currentPlayer.totalScore += score;
                document.getElementById(`player${i}-round${currentRound}-scorebox`).innerHTML=score;
    
                document.getElementById(`player${i}-round${currentRound}-bidbox`).innerHTML=`
                <tr>Tricks Bid: ${bidTricks}</tr>
                <br>
                <tr>Tricks Taken: ${takenTricks}</tr>`;

                document.getElementById(`player-${i}-total`).innerHTML = currentPlayer.totalScore;
            }

            document.getElementById(`round-${currentRound}-score`).hidden = true;
            rowErrorMessage.hidden = true;

            if (currentRound === roundsOfCards) {
                //scoreTable.hidden = true
                gameIsOver();
                }

            for(i = 0; i < playersPlaying; i ++) {
                playerArray[i].bidLocked = false;
            }

            currentRound += 1;
            if (gamePlayed === "Up and Down" && currentRound > 7) {
                cardsDealt --;
            } else {
                cardsDealt ++;
            }

            setNextDealer();
            whoHasHighestScore();
            buildRow();
        }
    }

    function gameIsOver() {
        let i;

        let gameWinner = playerFactory("gameWinner", -1);

        for (i = 0; i < playersPlaying; i ++) {
            if (playerArray[i].totalScore > gameWinner.totalScore) {
                gameWinner = playerArray[i];
            }
        }

        gameOver.hidden = false;
        gameOver.innerHTML = `
            <h1>The Game is Over</h1>
            <p>${gameWinner.name} is the Winner with a score of ${gameWinner.totalScore}</p>
        `;
    }