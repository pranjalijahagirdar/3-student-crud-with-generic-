const cl=console.log;

const studentForm = document.getElementById('studentForm')
const contactControl = document.getElementById('contactControl')
const emailControl = document.getElementById('emailControl')
const fnameControl = document.getElementById('fnameControl')
const lnameControl = document.getElementById('lnameControl')
const addStdBtn = document.getElementById('addStdBtn')
const updateStdBtn = document.getElementById('updateStdBtn')
const spinner = document.getElementById('spinner')
const stdList = document.getElementById('stdList')

const BASE_URL = `https://crud-6b7ce-default-rtdb.firebaseio.com`
const STUDENT_URL = `${BASE_URL}/students.json`;

function snackbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 3000
    })
}

function showSpinner() {
    spinner.classList.remove('d-none')
}
function hideSpinner() {
    spinner.classList.add('d-none')
}

const state={
    studentArr:[],
    editId:null,
}

function objToArr(data){
    for(const key in data){
        data[key].id=key;
        state.studentArr.unshift(data[key])
    }
}

function makeApicall(URL, methodName, body=null){
    return fetch(URL,{
        method:methodName,
        headers:{
            "content-type":"application/json",
            "Auth":"TOKEN JWT"
        },
        body:body?JSON.stringify(body):null
    })
    .then(res=>{
        if(!res.ok){
            throw new Error()
        }
        return res.json()
    })
}
fetchstudents()

//read

function fetchstudents(){
    showSpinner();
    makeApicall(STUDENT_URL,"GET")
    .then(data=>{
        cl(data);
        objToArr(data);
        oncreateStudent(state.studentArr)
    })
    .catch(err=>{
        cl(err);
        snackbar(err,'error');
    })
    .finally(()=>{
        hideSpinner()
    });
}

function oncreateStudent(arr){
    let result = ``;
    arr.forEach((ele)=>{
        result +=`<tr id="${ele.id}">
                            <td>${ele.contact}</td>
                            <td>${ele.email}</td>
                            <td>${ele.fname}</td>
                            <td>${ele.lname}</td>
                            <td onclick="editStd(this)" class="text-center">
                                 <i class="fa-solid fa-pen-to-square fa-2x text-primary" role="button"></i>
                            </td>
                            <td onclick="deleteStd(this)"  class="text-center">
                                 <i class="fa-solid fa-trash fa-2x text-danger" role="button"></i>
                            </td>
                        </tr>`
    })
    stdList.innerHTML = result;

}

//create

function onAddstudents(eve){
    eve.preventDefault()
    const stdObj={
        contact:contactControl.value,
        email:emailControl.value,
        fname:fnameControl.value,
        lname:lnameControl.value,
    }
    showSpinner()
    makeApicall(STUDENT_URL,"POST",stdObj)
    .then(res=>{
        stdObj.id = res.name,
        state.studentArr.unshift(stdObj)
        let tr = document.createElement('tr')
        tr.id = stdObj.id;
        tr.innerHTML = `<td>${stdObj.contact}</td>
                        <td>${stdObj.email}</td>
                        <td>${stdObj.fname}</td>
                        <td>${stdObj.lname}</td>
                        <td class="text-center">
                           <i onclick="editStd(this)" class="fa-solid fa-pen-to-square fa-2x text-primary" role="button"></i>
                        </td>
                        <td class="text-center">
                             <i onclick="deleteStd(this)" class="fa-solid fa-trash fa-2x text-danger" role="button"></i>
                        </td>`

           stdList.prepend(tr)
           studentForm.reset()
            snackbar('Student information added successfully !!!', 'success')
        })
        .catch(err => {
            snackbar('Failed to update student information !!!', 'error')
            cl(err)
        })
        .finally(() => {
            hideSpinner()
        })
}

//edit

function editStd(ele){
    let editId = ele.closest('tr').id;
    state.editId = editId;
    let EDIT_URL = `${BASE_URL}/students/${editId}.json`;
    showSpinner()
    makeApicall(EDIT_URL,"GET")
    .then(res=>{
        contactControl.value = res.contact;
        emailControl.value = res.email;
        fnameControl.value = res.fname;
        lnameControl.value = res.lname;
        addStdBtn.classList.add('d-none')
        updateStdBtn.classList.remove('d-none')
    })
    .catch(err=>{
        snackbar(err,'error')
    })
    .finally(()=>{
        hideSpinner()
    })
}

//delete

function deleteStd(ele){
    let removeId = ele.closest('tr').id;
     Swal.fire({
  title: "Are you sure?",
  icon: "warning",
  showCancelButton: true,
  confirmButtonText: "Yes, Remove it!"
}).then((result) => {
  if (result.isConfirmed) {
    showSpinner()
    let REMOVE_URL = `${BASE_URL}/students/${removeId}.json`;
    makeApicall(REMOVE_URL,"DELETE")
    .then(res => {
        let getIndex = state.studentArr.findIndex(m=>m.id === removeId)
        state.studentArr.splice(getIndex,1)
        ele.closest('tr').remove()
        snackbar(`The student information removed successfully !!`,'success')
    })
    .catch(err =>{
        snackbar(err,'error')
    })
    .finally(()=>{
        hideSpinner()
    })
  }
});

}

//update

function onupdateStd(){
    let updateId = state.editId;
    let UPDATE_URL = `${BASE_URL}/students/${updateId}.json`
    let oldObj = state.studentArr.find(b=>b.id === updateId)
    cl(oldObj)
    let updateObj={
        contact:contactControl.value,
        email:emailControl.value,
        fname:fnameControl.value,
        lname:lnameControl.value,
        id:updateId
    }
    showSpinner()
    makeApicall(UPDATE_URL, "PATCH",updateObj)
    .then(res=>{
        let getIndex = state.studentArr.findIndex(u=>u.id === updateId)
        state.studentArr[getIndex]=updateObj;
        let tr = document.getElementById(updateId)
        tr.innerHTML = `<td>${updateObj.contact}</td>
                        <td>${updateObj.email}</td>
                        <td>${updateObj.fname}</td>
                        <td>${updateObj.lname}</td>
                        <td class="text-center">
                           <i onclick="editStd(this)" class="fa-solid fa-pen-to-square fa-2x text-primary" role="button"></i>
                        </td>
                        <td class="text-center">
                            <i onclick="deleteStd(this)" class="fa-solid fa-trash fa-2x text-danger" role="button"></i>
                        </td>`

                studentForm.reset()
                addStdBtn.classList.remove('d-none')
                updateStdBtn.classList.add('d-none')
    })
    .catch(err=>{
        snackbar('failed to update student information !!!', 'error')
    })
    .finally(()=>{
        hideSpinner()
    })
}

studentForm.addEventListener('submit', onAddstudents)
updateStdBtn.addEventListener('click', onupdateStd)