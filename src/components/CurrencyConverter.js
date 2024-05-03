import { useEffect } from "react";
// `https://api.frankfurter.app/latest?amount=100&from=EUR&to=USD`

import { useState } from "react";

export default function App() {
    const [amount, setAmount] = useState(0)
    const [output, setOutput] = useState(null)
    const [fromCurrency, setFromCurrency] = useState("EUR")
    const [toCurrency, setToCurrency] = useState("USD")
    useEffect(function(){
        const controller = new AbortController();
        async function getConvertedAmount(){
            try{
                if(fromCurrency===toCurrency || amount===0){
                    setOutput(amount)
                    return;
                }
                const res=await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`,{signal:controller.signal});
                const resJson = await res.json()
                setOutput(resJson?.rates[toCurrency])
                console.log(resJson?.rates)
            }catch(e){}
        }
        getConvertedAmount();
        return function(){
            controller.abort();
        }
    },[amount, toCurrency, fromCurrency]);
    return (
      <div>
        <input type="number" value={amount} onChange={(e)=>setAmount(Number(e.target.value))}/>
        <select value={fromCurrency} onChange={(e)=>setFromCurrency(e.target.value)}>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="CAD">CAD</option>
          <option value="INR">INR</option>
        </select>
        <select value={toCurrency} onChange={(e)=>setToCurrency(e.target.value)}>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="CAD">CAD</option>
          <option value="INR">INR</option>
        </select>
        <p>{output}</p>
      </div>
    );
  }
  