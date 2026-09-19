import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { vehiclesService } from '../services';
import toast from 'react-hot-toast';

const VehicleContext = createContext(null);

export const VehicleProvider = ({ children }) => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [primaryVehicle, setPrimaryVehicleState] = useState(null);
  const [activeVehicle, setActiveVehicleState] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchVehicles = useCallback(async () => {
    if (user) {
      try {
        setLoading(true);
        const { data } = await vehiclesService.getGarage();
        const list = data.data || [];
        setVehicles(list);
        const primary = list.find((v) => v.isPrimary) || list[0] || null;
        setPrimaryVehicleState(primary);
        setActiveVehicleState(primary);
      } catch (err) {
        console.error('Failed to load garage vehicles:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Guest local active vehicle fallback
      const saved = localStorage.getItem('partsphere_guest_vehicle');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setVehicles([parsed]);
          setPrimaryVehicleState(parsed);
          setActiveVehicleState(parsed);
        } catch {
          setVehicles([]);
          setPrimaryVehicleState(null);
          setActiveVehicleState(null);
        }
      } else {
        setVehicles([]);
        setPrimaryVehicleState(null);
        setActiveVehicleState(null);
      }
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const addVehicle = async (vehicleData) => {
    if (user) {
      try {
        const { data } = await vehiclesService.addVehicle(vehicleData);
        const created = data.data;
        await fetchVehicles();
        toast.success('Vehicle added to your garage! 🚗');
        return created;
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to add vehicle.';
        toast.error(msg);
        throw err;
      }
    } else {
      // Guest vehicle mock
      const guestVehicle = {
        id: `guest_veh_${Date.now()}`,
        nickname: vehicleData.nickname || 'My Vehicle',
        regNumber: vehicleData.regNumber || '',
        isPrimary: true,
        variant: vehicleData.variant || {
          id: vehicleData.variantId,
          name: 'Standard Variant',
          year: 2022,
          model: { name: 'Vehicle', make: { name: 'Brand' } },
        },
      };
      setVehicles([guestVehicle]);
      setPrimaryVehicleState(guestVehicle);
      setActiveVehicleState(guestVehicle);
      localStorage.setItem('partsphere_guest_vehicle', JSON.stringify(guestVehicle));
      toast.success('Vehicle added to active session! 🚗');
      return guestVehicle;
    }
  };

  const updateVehicle = async (id, updateData) => {
    if (user) {
      try {
        const { data } = await vehiclesService.updateVehicle(id, updateData);
        await fetchVehicles();
        toast.success('Vehicle details updated!');
        return data.data;
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update vehicle.');
        throw err;
      }
    } else {
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...updateData } : v))
      );
      toast.success('Vehicle updated!');
    }
  };

  const setPrimaryVehicle = async (id) => {
    if (user) {
      try {
        const { data } = await vehiclesService.setPrimaryVehicle(id);
        await fetchVehicles();
        toast.success('Primary vehicle updated! ⭐');
        return data.data;
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to set primary vehicle.');
        throw err;
      }
    } else {
      setVehicles((prev) =>
        prev.map((v) => ({ ...v, isPrimary: v.id === id }))
      );
      const sel = vehicles.find((v) => v.id === id);
      if (sel) {
        setPrimaryVehicleState(sel);
        setActiveVehicleState(sel);
      }
      toast.success('Primary vehicle updated! ⭐');
    }
  };

  const deleteVehicle = async (id) => {
    if (user) {
      try {
        await vehiclesService.removeVehicle(id);
        await fetchVehicles();
        toast.success('Vehicle removed from garage.');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to remove vehicle.');
        throw err;
      }
    } else {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      setPrimaryVehicleState(null);
      setActiveVehicleState(null);
      localStorage.removeItem('partsphere_guest_vehicle');
      toast.success('Vehicle removed.');
    }
  };

  const selectVehicleForFitment = (vehicle) => {
    setActiveVehicleState(vehicle);
    toast.success(
      `Filtering catalog for ${vehicle.variant?.model?.make?.name || ''} ${
        vehicle.variant?.model?.name || ''
      }`
    );
  };

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        primaryVehicle,
        activeVehicle: activeVehicle || primaryVehicle,
        loading,
        fetchVehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        setPrimaryVehicle,
        selectVehicleForFitment,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicles = () => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
};

export const useVehicle = useVehicles;

export default VehicleContext;
