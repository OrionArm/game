import Modal from "@/shared/ui/modal";
import { Chest } from "./chest";

export const ChestModal = ({ onClose, isOpen, description }: { description: string; onClose: () => void, isOpen: boolean }) => isOpen && <Modal isOpen={isOpen} onClose={() => onClose()}> <Chest onClose={() => onClose()} description={description}/></Modal>

