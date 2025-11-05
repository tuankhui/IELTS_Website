"use client"
import { useState } from "react";
import { PiUploadSimpleBold, PiXCircleBold } from "react-icons/pi";
import { Spacer } from "@nextui-org/react";
// import TopBar from "../components/TopBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import FileUpload from "../../components/Reading/FileUpload";
import TranslateButton from "../../components/Reading/translatebutton";

export default function TranslatePage() {
    const [file, setFile] = useState();

    return (<div className="translate-page">
        <Header />
        <div className="translate-content">
            <FileUpload 
            size='lg'
            accept='application/pdf'
            startContent={<PiUploadSimpleBold />}
            rejectProps={{ color: 'danger', startContent: <PiXCircleBold /> }}
            onUpload={files => {
                setFile(files[0]);
            }}
            />
            <Spacer/>
            <TranslateButton file={file} />
        </div>
        <Footer/>
    </div>)
}