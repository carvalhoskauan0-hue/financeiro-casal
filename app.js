const SUPABASE_URL =
"https://ucnsdwfcwklyyrihkdca.supabase.co";

const SUPABASE_KEY =
"sb_publishable_XCB8Cgn5DyMw25vCvL03qA_5aOOCFRj";

const { createClient } = supabase;

const client =
createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const emailInput =
document.getElementById("email");

const senhaInput =
document.getElementById("senha");

const loginPage =
document.getElementById("loginPage");

const app =
document.getElementById("app");

const btnLogin =
document.getElementById("btnLogin");

const btnLogout =
document.getElementById("btnLogout");

const tbody =
document.getElementById("tbody");

let lancamentos = [];

document
.getElementById("data")
.value =
new Date()
.toISOString()
.substring(0,10);

btnLogin.addEventListener(
    "click",
    login
);

btnLogout.addEventListener(
    "click",
    logout
);

document
.getElementById("btnSalvar")
.addEventListener(
    "click",
    salvarLancamento
);

document
.getElementById("pesquisa")
.addEventListener(
    "input",
    renderTabela
);

document
.getElementById("filtroPessoa")
.addEventListener(
    "change",
    renderTabela
);

async function login(){

    const {
        error
    } =
    await client.auth
    .signInWithPassword({

        email:
        emailInput.value,

        password:
        senhaInput.value

    });

    if(error){

        alert(
            error.message
        );

        return;
    }

    loginPage
    .classList
    .add("hidden");

    app
    .classList
    .remove("hidden");

    carregarLancamentos();
}

async function logout(){

    await client
    .auth
    .signOut();

    location.reload();
}

async function salvarLancamento(){

    const data =
    document
    .getElementById("data")
    .value;

    const descricao =
    document
    .getElementById("descricao")
    .value;

    const valor =
    Number(
        document
        .getElementById("valor")
        .value
    );

    const tipo =
    document
    .getElementById("tipo")
    .value;

    const categoria =
    document
    .getElementById("categoria")
    .value;

    const responsavel =
    document
    .getElementById("responsavel")
    .value;

    const {
        error
    } =
    await client
    .from("lancamentos")
    .insert([
        {
            data,
            descricao,
            categoria,
            tipo,
            responsavel,
            valor
        }
    ]);

    if(error){

        alert(
            error.message
        );

        return;
    }

    carregarLancamentos();

    document
    .getElementById("descricao")
    .value = "";

    document
    .getElementById("valor")
    .value = "";
}

async function carregarLancamentos(){

    const {
        data,
        error
    } =
    await client
    .from("lancamentos")
    .select("*")
    .order(
        "id",
        {
            ascending:false
        }
    );

    if(error){

        alert(
            error.message
        );

        return;
    }

    lancamentos =
    data;

    atualizarDashboard();

    renderTabela();
}

function atualizarDashboard(){

    let receitas = 0;

    let despesas = 0;

    lancamentos.forEach(l=>{

        if(
            l.tipo ===
            "Receita"
        ){

            receitas +=
            Number(
                l.valor
            );
        }

        if(
            l.tipo ===
            "Despesa"
        ){

            despesas +=
            Number(
                l.valor
            );
        }

    });

    document
    .getElementById("receitas")
    .innerText =
    "R$ " +
    receitas.toFixed(2);

    document
    .getElementById("despesas")
    .innerText =
    "R$ " +
    despesas.toFixed(2);

    document
    .getElementById("saldo")
    .innerText =
    "R$ " +
    (
        receitas -
        despesas
    )
    .toFixed(2);

    document
    .getElementById("qtd")
    .innerText =
    lancamentos.length;
}

function renderTabela(){

    const busca =
    document
    .getElementById("pesquisa")
    .value
    .toLowerCase();

    const filtro =
    document
    .getElementById("filtroPessoa")
    .value;

    tbody.innerHTML = "";

    const filtrados =
    lancamentos.filter(l=>{

        const texto =
        (
            l.descricao +
            l.categoria +
            l.responsavel
        )
        .toLowerCase();

        const okTexto =
        texto.includes(
            busca
        );

        const okPessoa =
        filtro === ""
        ||
        l.responsavel ===
        filtro;

        return (
            okTexto &&
            okPessoa
        );

    });

    filtrados
    .forEach(l=>{

        tbody.innerHTML += `
        <tr>

        <td>
        ${l.data}
        </td>

        <td>
        ${l.descricao}
        </td>

        <td>
        ${l.categoria}
        </td>

        <td>
        ${l.tipo}
        </td>

        <td>
        ${l.responsavel}
        </td>

        <td>
        R$ ${Number(l.valor).toFixed(2)}
        </td>

        <td>

        <button
        class="btn-delete">
        🗑️
        </button>

        </td>

        </tr>
        `;

    });
}

client.auth
.getSession()
.then(({data})=>{

    if(
        data.session
    ){

        loginPage
        .classList
        .add("hidden");

        app
        .classList
        .remove("hidden");

        carregarLancamentos();
    }

});