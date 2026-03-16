function exportPDF(){

const dashboard=document.getElementById("dashboard-content")

if(!dashboard){
alert("Dashboard tidak ditemukan")
return
}

const data={}

data.kpi=document.getElementById("kpi-container").innerHTML

data.energyChart=document.getElementById("energyChart").toDataURL("image/png",1.0)

data.emissionChart=document.getElementById("emissionChart").toDataURL("image/png",1.0)

data.facilityChart=document.getElementById("facilityChart").toDataURL("image/png",1.0)

data.date=new Date().toLocaleDateString()

localStorage.setItem("helixon_report",JSON.stringify(data))

window.open("preview.html","_blank")

}
