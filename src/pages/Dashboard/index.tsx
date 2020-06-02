import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      // LOAD FOODS
      const response = await api.get<IFoodPlate[]>('/foods');
      setFoods(response.data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    // ADD A NEW FOOD PLATE TO THE API
    Object.assign(food, { available: true });
    const response = await api.post<IFoodPlate>('/foods', food);
    const newFood = response.data;
    setFoods([...foods, newFood]);
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    // UPDATE A FOOD PLATE ON THE API
    const { id, available } = editingFood;
    //
    // add in food object the id and available
    Object.assign(food, { id, available });
    const response = await api.put<IFoodPlate>(`/foods/${id}`, food);
    const updatedFood = response.data;
    //
    const index = foods.findIndex(item => item.id === id);
    if (index >= 0) {
      const newListFoods = [...foods];
      newListFoods[index] = updatedFood;
      setFoods(newListFoods);
    }
  }

  async function handleDeleteFood(id: number): Promise<void> {
    // DELETE A FOOD PLATE FROM THE API
    await api.delete(`/foods/${id}`);
    const newList = foods.filter(item => item.id !== id);
    setFoods(newList);
  }

  async function handleFoodAvailable(
    food: IFoodPlate,
    available: boolean,
  ): Promise<void> {
    if (food) {
      // update the available
      Object.assign(food, { available });
      const response = await api.put<IFoodPlate>(`/foods/${food.id}`, food);
      const updatedFood = response.data;
      //
      const index = foods.findIndex(item => item.id === food.id);
      if (index >= 0) {
        const newListFoods = [...foods];
        newListFoods[index] = updatedFood;
        setFoods(newListFoods);
      }
    }
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    // SET THE CURRENT EDITING FOOD ID IN THE STATE
    setEditingFood(food);
    toggleEditModal();
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
              handleFoodAvailable={handleFoodAvailable}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
