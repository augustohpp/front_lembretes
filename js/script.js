const userLogged = '__User'
const usersList = '__users'
const recadosList = '__Recados'
var backUrl = 'https://back-lembretes.herokuapp.com'


function verificarLogin(){
    var storage = localStorage.getItem(userLogged)

    if(!storage || storage == null || storage == ''){
        window.location.href = './Login.html'
    }else{
        // window.location.href = './index.html'
        listarRecados()
        alert('Para editar um recado, clique em cima do campo que deseja editar')
    }
}

function logout(){
    localStorage.removeItem(userLogged)
    verificarLogin()
}

async function fazerLogin(e){
    e.preventDefault();
    
    var mensagem
    // var local = localStorage.getItem(usersList)
    var obj = await axios.get(`${backUrl}/users`)
    var emailInput = document.getElementById('emailLogin').value
    var senhaInput = document.getElementById('senhaLogin').value

    if(!emailInput || !senhaInput){
        alert('campo senha e email deve estar preenchido')
        return false
    }
    
    for(let i = 0; i < obj.data.length; i++){
        if(emailInput == obj.data[i].email && senhaInput == obj.data[i].password){
            var dados = JSON.stringify(obj.data[i])
            localStorage.setItem(userLogged,dados)
            window.location.href = './index.html'
            return false
        }
        mensagem = 'Email ou Senha incorretos'
    }
    alert(mensagem)
}

async function criarConta(e){
    e.preventDefault()

    var nomeInput = document.getElementById('nomeLogin').value
    var emailInput = document.getElementById('emailLogin').value
    var senhaInput = document.getElementById('senhaLogin').value

    if(!nomeInput || nomeInput == null || nomeInput == '' || !emailInput || emailInput == null || emailInput == '' || !senhaInput || !senhaInput == null || senhaInput == ''){
        alert('necessário preencher todos os campos')
        return false
    }

    var novoUser = {
        name: nomeInput,
        email: emailInput,
        password: senhaInput
    }

    await axios.post(`${backUrl}/users`, novoUser)
    alert('cadastrado')
    setTimeout(() => {
        window.location.href = './index.html'
    },500)
}

async function listarRecados(){
    // var recadosLocal = localStorage.getItem(recadosList)
    var listaRecados = await axios.get(`${backUrl}/lembretes`)
    var tbody = document.getElementById('tbody')
    var lista = ''
    
    if(typeof listaRecados.data === 'string') {
        lista += `
            <tr>
                <td colspan="4">
                    <h4>${listaRecados.data}. Tente criar um.</h4>
                </td>
            <tr>
        `
        tbody.innerHTML = lista
        return false
    }

    for(let i = 0; i < listaRecados.data.length; i++){
        if(listaRecados.data[i].completado == false){
            lista += `
                <tr>
                    <td><input id="title${listaRecados.data[i].id}" class="input" type="text" value="${listaRecados.data[i].title}" onchange="editarRecado(${listaRecados.data[i].id}, 'title')"></td>
                    <td><input id="description${listaRecados.data[i].id}" class="input" type="text" value="${listaRecados.data[i].description}" onchange="editarRecado(${listaRecados.data[i].id}, 'description')"></td>
                    <td class="buttons">
                        <button class="btn btn-danger btn-sm" onclick="deletarRecado(${listaRecados.data[i].id}, event)">Deletar</button>
                        <button class="btn btn-success btn-sm" id="bntConcluir" onclick="completarRecado(${listaRecados.data[i].id}, event)">Concluir</button>
                    </td>
                <tr>
            `
        }else{
            lista += `
                <tr>
                    <td class="concluido"><input id="title${listaRecados.data[i].id}" class="input" type="text" value="${listaRecados.data[i].title}" onchange="editarRecado(${listaRecados.data[i].id}, 'title')"></td>
                    <td class="concluido"><input id="description${listaRecados.data[i].id}" class="input" type="text" value="${listaRecados.data[i].description}" onchange="editarRecado(${listaRecados.data[i].id}, 'description')"></td>
                    <td class="buttons">
                        <button class="btn btn-danger btn-sm" onclick="deletarRecado(${listaRecados.data[i].id}, event)">Deletar</button>
                        <button class="btn btn-warning btn-sm" id="bntConcluir" onclick="completarRecado(${listaRecados.data[i].id}, event)">Desmarcar</button>
                    </td>
                <tr>
            `
        }
    }
    tbody.innerHTML = lista
}

async function criarRecado(e){
    e.preventDefault()
    // var recadosLocal = localStorage.getItem(recadosList)
    var descricaoInput = document.getElementById('descricaoInput').value
    var detalheInput = document.getElementById('detalheInput').value

    if((descricaoInput == null || !descricaoInput) && (detalheInput == null || !detalheInput)){
        alert('Não há nada para adicionar')
        return false
    }
    if(!descricaoInput){
        alert("Descrição não pode ser nulo")
        return false
    }
    if(!detalheInput){
        alert("Detalhe não pode ser nulo")
        return false
    }

    var recado = {
        title: descricaoInput,
        description: detalheInput,
        completado: false
    }

    await axios.post(`${backUrl}/lembretes`, recado)

    descricaoInput = document.getElementById('descricaoInput').value = ''
    detalheInput = document.getElementById('detalheInput').value = ''

    listarRecados()
}

async function deletarRecado(id, e){
    e.preventDefault()

    var confirm = window.confirm('Tem certeza que deseja deletar?')

    if(confirm == false){
        return false
    }

    await axios.delete(`${backUrl}/lembretes/${id}`)
    listarRecados()
}

async function editarRecado(id, campo){
    var input = document.getElementById(campo+id).value

    var editarRecado = {}
    editarRecado[campo] = input
    await axios.put(`${backUrl}/lembretes/${id}`, editarRecado)
    listarRecados()
}

async function completarRecado(id, e){
    e.preventDefault()

    var lembreteSelecionado = await axios.get(`${backUrl}/lembretes/${id}`)
    var teste = lembreteSelecionado.data.completado

    var completado = {
        completado: !teste
    }

    await axios.put(`${backUrl}/lembretes/${id}`, completado)

    listarRecados()
}