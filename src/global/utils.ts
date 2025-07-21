import { createSignal } from "solid-js";
import { VNTextPatch } from "./VNTextPatch";


export const [ isProjectOpen, setProjectStatus ] = createSignal(false)
export const [ vn ] = createSignal(new VNTextPatch())