import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { useState, useMemo } from "react";
import { formatDateEn, GetDateTimestamp } from "./services/timeFunctions";
import { FormInterpreter } from "./FormInterpreter";
import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";
import DICOMViewer from "./DICOMViewer";

export const TaskDetails = ({ isOpen, onClose, taskData: data }) => {
    const [selectedForm, setSelectedForm] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState([]); // 📌 Stocke les fichiers DICOM sélectionnés
    const date = data && data["date"] ? new Date(GetDateTimestamp(data["date"])) : null;

    const formsInRow = useMemo(() => {
        if (!data) return [];
        let forms = [];
        let actualForm = data.$created_on_content?.children[0];
        forms.push(actualForm?.formData);
        if (actualForm?.children) forms.push(actualForm.children.formData);
        return forms;
    }, [data]);

    const totalPages = formsInRow.length + 1;
    
    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        const urls = files.map((file) => URL.createObjectURL(file));
    
        setUploadedFiles(prevFiles => [...prevFiles, ...urls]);
    };
    

    return (
        <Modal scrollBehavior="inside" shouldBlockScroll size="2xl" onClose={onClose} backdrop="blur" isOpen={isOpen}>
            {data && (
                <ModalContent>
                    <ModalHeader>
                        <h1 className="text-zinc-900 tracking-wider font-normal">Manage Task</h1>
                    </ModalHeader>

                    <ModalBody className="p-4">
                        {isOpen && (
                            <div className="flex flex-col">
                                {selectedForm === formsInRow.length ? (
                                    <DICOMViewer dicomFiles={uploadedFiles} />
                                ) : (
                                    <>
                                        <FormInterpreter data={data} form={formsInRow[selectedForm]} />
                                        
                                        {selectedForm === 1 && (
                                            <div className="mt-4">
                                                <label className="text-sm text-gray-700">Upload DICOM files:</label>
                                                <input
                                                    type="file"
                                                    accept=".dcm"
                                                    multiple
                                                    onChange={handleFileUpload}
                                                    className="block w-full border border-gray-300 rounded-md p-2 mt-2"
                                                />
                                            </div>
                                        )}

                                        {uploadedFiles.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-sm text-gray-700">Selected DICOM Files:</p>
                                                <ul className="list-disc pl-5">
                                                    {uploadedFiles.map((file, index) => (
                                                        <li key={index} className="text-sm text-gray-600">
                                                            {file.name || `File ${index + 1}`}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button onPress={() => setSelectedForm(Math.max(selectedForm - 1, 0))}>⬅️</Button>
                        <Button onPress={() => setSelectedForm(Math.min(selectedForm + 1, totalPages - 1))}>➡️</Button>
                    </ModalFooter>
                </ModalContent>
            )}
        </Modal>
    );
};
