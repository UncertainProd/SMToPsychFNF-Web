<script>
    import { tweened } from 'svelte/motion'
    import { cubicOut } from 'svelte/easing'
    import SMForm from './SMForm.svelte';
    let tvalue = tweened(0);
    function handleClick(e) {
        document.getElementById('fileupload').click();
    }

    function handleFileChange(e)
    {
        // console.log(e);
        if(e.target.files[0].name.endsWith('.sm'))
        {
            tvalue.set(1, {
                duration: 400,
                easing: cubicOut
            });
        }
    }
</script>

<div style={`position:relative; top:${-300 * $tvalue - 150}px; opacity:${1 - $tvalue}`}>
    <h2>Choose the Simfile you want to convert</h2>
    <button on:click={handleClick}>Select *.sm file</button>
    <input on:change={handleFileChange} type="file" name="fileupload" id="fileupload" style="display: none;">
</div>
<SMForm pos={tvalue}/>

<style>
div
{
    background-color: lightgray;
    color: black;
    grid-row: 2;
    grid-column: 2;
    height: 60%;
    position: relative;
    border-radius: 10px;
}

button
{
    border: none;
    background-color: dodgerblue;
    width: 60%;
    height: 50%;
    margin: 5% 0 0 20%;
    border-radius: 10px;
    font-size: x-large;
    transition: background-color 0.1s ease-in;
}

button:hover
{
    background-color: cornflowerblue;
}

h2
{
    text-align: center;
}
</style>