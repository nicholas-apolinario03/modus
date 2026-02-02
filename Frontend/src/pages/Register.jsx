import { useState } from "react";

function Register() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [nome, setNome] = useState("");

    async function handlerSubmit(e) {

        try {
            const response = await fetch("http://localhost:3000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ nome, email, senha })
            })

            const data = await response.json()
            console.log(data)

        } catch (error) {
            console.error(error)
        }
    }



    return (
        <form onSubmit={handlerSubmit}>
            <input placeholder="nome" value={nome} onChange={e => setNome(e.target.value)} />
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} />
            <button type="submit">Registar</button>
        </form>
    )

}

export default Register
