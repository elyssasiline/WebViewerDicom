import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { useState, useMemo } from "react";
import { formatDateEn, GetDateTimestamp } from "./services/timeFunctions";
import { FormInterpreter } from "./FormInterpreter";
import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";
import DICOMViewer from "./DICOMViewer";

export const TaskDetails = ({ isOpen, onClose, taskData: data }) => {
    const [selectedForm, setSelectedForm] = useState(0); // 📌 Gestion des pages du formulaire
    const date = data && data["date"] ? new Date(GetDateTimestamp(data["date"])) : null;

    const formsInRow = useMemo(() => {
        if (!data) return [];
        let forms = [];
        let actualForm = data.$created_on_content?.children[0];
        forms.push(actualForm?.formData);
        if (actualForm?.children) forms.push(actualForm.children.formData);
        return forms;
    }, [data]);

    const totalPages = formsInRow.length + 1; // 📌 On ajoute le DICOMViewer comme une "page" supplémentaire

    return (
        <Modal scrollBehavior="inside" shouldBlockScroll size="2xl" onClose={onClose} backdrop="blur" isOpen={isOpen}>
            {data && (
                <ModalContent>
                    <ModalHeader>
                        <div className="flex flex-col w-full">
                            <h1 className="text-zinc-900 tracking-wider font-normal">Manage Task</h1>
                            <div className="flex h-fit pt-4 z-20 w-full justify-between border-b border-zinc-100 pb-2 items-center">
                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-3 items-center">
                                        <div className="flex-none border-1 border-default-200/50 rounded-small text-center w-11 overflow-hidden">
                                            <div className="text-tiny bg-default-100 py-0.5 text-default-500">
                                                {date.toLocaleString("en-US", { month: "short" })}
                                            </div>
                                            <div className="flex items-center justify-center font-semibold text-sm h-6 text-default-500">
                                                {date.getDate()}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-sm text-foreground font-light">{formatDateEn(date)}</p>
                                            <p className="text-xs text-default-500">00:00 AM</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex pt-1 flex-row-reverse h-fit gap-3 items-center">
                                    <span className="text-small font-light text-default-500">{data.email}</span>
                                </div>
                            </div>
                        </div>
                    </ModalHeader>

                    <ModalBody className="p-4">
                        {isOpen && (
                            <div className="flex flex-col">
                                {selectedForm === formsInRow.length ? (
                                    <DICOMViewer dicomUrl="wadouri:http://localhost:5173/dicom-files/image-00000.dcm" />
                                ) : (
                                    <FormInterpreter data={data} form={formsInRow[selectedForm]} />
                                )}
                            </div>
                        )}
                    </ModalBody>



                    <ModalFooter>
                        <div className="flex flex-col w-full">
                            <div className="flex gap-2 pb-4 pr-4 flex-row">
                                <Button
                                    onPress={() => setSelectedForm(Math.max(selectedForm - 1, 0))}
                                    color={selectedForm === 0 ? "default" : "primary"}
                                    isDisabled={selectedForm === 0}
                                    variant="solid"
                                    size="sm"
                                >
                                    <FaLongArrowAltLeft />
                                </Button>
                                <Button
                                    onPress={() => setSelectedForm(Math.min(selectedForm + 1, totalPages - 1))}
                                    isDisabled={selectedForm === totalPages - 1}
                                    color={selectedForm === totalPages - 1 ? "default" : "primary"}
                                    variant="solid"
                                    className="hover:scale-105"
                                    size="sm"
                                >
                                    <FaLongArrowAltRight />
                                </Button>
                            </div>
                            <div className="flex ml-auto gap-2">
                                <Button variant="flat" color="danger">
                                    Delete
                                </Button>
                                <Button variant="flat" color="primary">
                                    Register
                                </Button>
                            </div>
                        </div>
                    </ModalFooter>
                </ModalContent>
            )}
        </Modal>
    );
};
