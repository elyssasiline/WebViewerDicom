import { Avatar, Button, DatePicker, Input, Select, SelectItem } from "@heroui/react"
import { capitalize, lowerCase } from "lodash"
import { FaLocationDot } from "react-icons/fa6";
import { GetDateTimestamp, customParseDate } from "./services/timeFunctions";
import { fromDate } from '@internationalized/date';
import { Accordion, AccordionItem } from "@heroui/react";
import { RiEdit2Fill } from "react-icons/ri";
import DICOMViewer from "./DICOMViewer";

const interpretElement = ({ element, data, index, dicomUrl }) => {
   
    if (element.field_type == "dicom_viewer") {
        if (!dicomUrl) return null;
        return (
            <div key={index} className="flex flex-col items-center">
                <DICOMViewer dicomUrl={dicomUrl} />
            </div>
        );
    }

    if (element.field_type == "input") {
        if (element.input_type == "text") {
            return <Input key={index} isClearable className="dark:text-zinc-200" value={data}
                placeholder={`Enter ${lowerCase(element.field_label)} ...`} size="sm" label={element.field_label} />
        }
    }

    else if (element.field_type == "location") {
        return <div key={index} className="flex flex-col">
            <p className="text-xs mb-1  text-zinc-400 p-0">{element.field_label || element.field_key} :</p>
            <div className="flex gap-2">
                <Input value={data.latitude} className="dark:text-zinc-200" placeholder="Enter longitude ..." size="sm" label="Latitude" />
                <Input value={data.longitude} className="dark:text-zinc-200" placeholder="Enter latitude ..." size="sm" label="Longitude" />
                <Button color="primary" isDisabled size="sm" className="h-auto"><FaLocationDot className="size-4" /></Button>
            </div>
        </div>
    }
    else if (element.field_type == "datepicker") {
        const date = customParseDate(data)
        const calendarDate = fromDate(date)
        return <DatePicker key={index} value={calendarDate} size="sm" label={element.field_label || element.field_key} />
    }

    else if (element.field_type == "select") {

        return <Select selectedKeys={[data]} size="sm" label="Praticien" className="!text-zinc-200">
            {[
                "Généraliste",
                "Cardiologue",
                "Dermatologue",
                "Ophtalmologue",
                "Pédiatre",
                "Radiologue",
                "Chirurgien",
                "Psychiatre"
            ].map(specialty => (
                <SelectItem key={specialty} className="text-zinc-200">
                    {specialty}
                </SelectItem>
            ))}
        </Select>
    }
}

export const FormInterpreter = ({ form, data, dicomUrl = "wadouri:http://localhost:5173/dicom-files/image-00000.dcm" }) => {
    return (
        <div className="flex h-full gap-2 flex-col">
            {form?.form.map((element, index) =>
                interpretElement({ element, data: data[element.field_key], index, dicomUrl }) // ✅ dicomUrl est bien transmis !
            )}
        </div>
    );
};