<script>
    import { cubicOut } from 'svelte/easing'
    export let pos;

    function onBackClicked(e)
    {
        pos.set(0, {
            duration: 400,
            easing: cubicOut
        });
    }
</script>

<div style={`opacity: ${$pos}; transform: translateY(${-500 * $pos}px)`}>
    <form on:submit|preventDefault={(e)=>{}}>
        <div class="form-option">
            <label for="chartindex">Select Chart </label>
            <select name="chartindex" id="chartindex">
                <!-- <option value="testopt1">Test1</option>
                <option value="testopt2">Test2</option>
                <option value="testopt3">Test3</option> -->
            </select>
        </div>
        
        <div class="form-option">
            <label for="songname">Song Name</label>
            <input type="text" name="songname" id="songname" />
        </div>

        <div class="form-option">
            <label for="songspeed">Song Speed</label>
            <input type="number" name="songspeed" id="songspeed" min="0" max="1000" step="0.1" value="1">
        </div>

        <div class="form-option">
            <label for="player1">Name of Player 1 </label>
            <input type="text" name="player1" id="player1" value="bf" />
        </div>

        <div class="form-option">
            <label for="player2">Name of Player 2 </label>
            <input type="text" name="player2" id="player2" value="dad" />
        </div>
        
        <div class="form-option">
            <label for="gfversion">gf version </label>
            <input type="text" name="gfversion" id="gfversion" value="gf" />
        </div>
        
        <div class="flip-chart">
            <label for="flipchart">Flip chart </label>
            <input type="checkbox" name="flipchart" id="flipchart" />
            <div>Note: dance-single + flip-chart = bf sings all the notes</div>
        </div>
        
        <button id="generate-chart">Generate FNF Chart!</button>
    </form>
    <button id="back-button" on:click={onBackClicked}>&lt; Go Back</button>
</div>

<style>
div
{
    background-color: white;
    color: black;
    border-radius: 5px;
}

.flip-chart
{
    padding: 10px;
}

.form-option
{
    padding: 10px;
}

.form-option > input
{
    position: relative;
    left: 5px;
    width: 50%;
    height: 3vh;
    background-color: #efefef;
    border-radius: 3px;
}

#generate-chart
{
    border: none;
    background-color: dodgerblue;
    width: 60%;
    height: 50%;
    margin: 5% 0 0 20%;
    border-radius: 10px;
    font-size: x-large;
    transition: background-color 0.1s ease-in;
    position: relative;
    top: -10px;
}

#generate-chart:hover
{
    background-color: cornflowerblue;
}

#back-button
{
    position: relative;
    left: 2px;
    top: -2px;
    padding: 2px;
    border: none;
    background-color: rgb(0, 153, 255);
    border-radius: 4px;
}
</style>