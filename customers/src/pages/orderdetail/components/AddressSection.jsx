import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const AddressSection = ({ address, state }) => {
  const navigate = useNavigate();

  return (
    <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
      <div className="flex justify-between items-center">
        <div className="flex">
          <div className="w-10 flex justify-center items-start">
            <FaMapMarkerAlt className="text-red-500" />
          </div>
          <div className="flex-1">
            <p>{address.recipientName} ({address.phoneNumber})</p>
            {address.note && <p>{address.note}</p>}
            <p>{`${address.city}, ${address.district}, ${address.ward}`}</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/addressselection", { state: state })}
          className="text-gray-500 hover:text-gray-700"
        >
          <MdKeyboardArrowRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default AddressSection;